from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
from typing import List, Dict, Any
from pydantic import BaseModel
import re

app = FastAPI(title="Excel to SQL Converter API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ColumnSchema(BaseModel):
    name: str
    type: str
    nullable: bool = True
    primary_key: bool = False

class TableSchema(BaseModel):
    name: str
    columns: List[ColumnSchema]

class SQLResponse(BaseModel):
    tables: List[TableSchema]
    sql: str

def infer_sql_type(series: pd.Series) -> str:
    """Infer SQL data type from pandas series"""
    if series.dtype == 'object':
        max_length = series.astype(str).str.len().max()
        if max_length <= 50:
            return f"VARCHAR({max_length})"
        elif max_length <= 255:
            return f"VARCHAR({max_length})"
        else:
            return "TEXT"
    elif series.dtype in ['int64', 'int32']:
        return "INTEGER"
    elif series.dtype in ['float64', 'float32']:
        return "DECIMAL(10,2)"
    elif series.dtype == 'bool':
        return "BOOLEAN"
    elif series.dtype == 'datetime64[ns]':
        return "TIMESTAMP"
    else:
        return "VARCHAR(255)"

def clean_column_name(name: str) -> str:
    """Clean column names to be SQL-compliant"""
    # Remove special characters and replace with underscores
    cleaned = re.sub(r'[^a-zA-Z0-9_]', '_', str(name))
    # Remove consecutive underscores
    cleaned = re.sub(r'_+', '_', cleaned)
    # Remove leading/trailing underscores
    cleaned = cleaned.strip('_')
    # Ensure it doesn't start with a number
    if cleaned and cleaned[0].isdigit():
        cleaned = f"col_{cleaned}"
    return cleaned.lower() if cleaned else "unnamed_column"

def generate_create_table_sql(table_name: str, columns: List[ColumnSchema]) -> str:
    """Generate CREATE TABLE SQL statement"""
    sql_parts = [f"CREATE TABLE {table_name} ("]
    
    column_definitions = []
    for col in columns:
        definition = f"  {col.name} {col.type}"
        if col.primary_key:
            definition += " PRIMARY KEY"
        elif not col.nullable:
            definition += " NOT NULL"
        column_definitions.append(definition)
    
    sql_parts.append(",\n".join(column_definitions))
    sql_parts.append(");")
    
    return "\n".join(sql_parts)

@app.get("/")
async def root():
    return {"message": "Excel to SQL Converter API"}

@app.post("/api/upload", response_model=SQLResponse)
async def upload_excel(file: UploadFile = File(...)):
    """Upload Excel file and convert to SQL schema"""
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    try:
        # Read the uploaded file
        contents = await file.read()
        excel_file = pd.ExcelFile(io.BytesIO(contents))
        
        tables: List[TableSchema] = []
        sql_statements: List[str] = []
        
        # Process each sheet in the Excel file
        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Skip empty sheets
            if df.empty:
                continue
            
            # Clean table name
            table_name = clean_column_name(sheet_name)
            
            # Analyze columns
            columns: List[ColumnSchema] = []
            for col_name in df.columns:
                cleaned_name = clean_column_name(col_name)
                sql_type = infer_sql_type(df[col_name])
                
                # Check if column has null values
                has_nulls = df[col_name].isnull().any()
                
                columns.append(ColumnSchema(
                    name=cleaned_name,
                    type=sql_type,
                    nullable=has_nulls,
                    primary_key=False  # Could be enhanced to detect primary keys
                ))
            
            table_schema = TableSchema(name=table_name, columns=columns)
            tables.append(table_schema)
            
            # Generate SQL
            sql = generate_create_table_sql(table_name, columns)
            sql_statements.append(sql)
        
        if not tables:
            raise HTTPException(status_code=400, detail="No valid data found in Excel file")
        
        combined_sql = "\n\n".join(sql_statements)
        
        return SQLResponse(tables=tables, sql=combined_sql)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)