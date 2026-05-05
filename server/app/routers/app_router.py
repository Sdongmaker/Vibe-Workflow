from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.utils.workflow_helper import (
    calculate_dynamic_cost_helper,
    get_file_upload_url_helper,
    save_uploaded_file_helper,
)

router = APIRouter()


@router.get("/get_file_upload_url")
async def get_file_upload_url(request: Request):
    try:
        # FastAPI's request.query_params returns an immutable dict-like object
        params = dict(request.query_params)
        return await get_file_upload_url_helper(params)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload_file")
async def upload_file(file: UploadFile = File(...)):
    try:
        return await save_uploaded_file_helper(file)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/calculate_dynamic_cost")
async def calculate_dynamic_cost(request: Request):
    try:
        payload = await request.json()
        return await calculate_dynamic_cost_helper(payload)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))
