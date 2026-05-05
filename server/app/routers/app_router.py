from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.utils.workflow_helper import (
    calculate_dynamic_cost_helper,
    get_file_upload_url_helper,
    public_exception_detail,
    public_http_exception_detail,
    save_uploaded_file_helper,
)

router = APIRouter()


@router.get("/get_file_upload_url")
async def get_file_upload_url(request: Request):
    try:
        params = dict(request.query_params)
        return await get_file_upload_url_helper(params)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise HTTPException(
                status_code=e.status_code,
                detail=public_http_exception_detail(e),
                headers=e.headers,
            )
        raise HTTPException(status_code=400, detail=public_exception_detail(e))


@router.post("/upload_file")
async def upload_file(file: UploadFile = File(...)):
    try:
        return await save_uploaded_file_helper(file)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise HTTPException(
                status_code=e.status_code,
                detail=public_http_exception_detail(e),
                headers=e.headers,
            )
        raise HTTPException(status_code=400, detail=public_exception_detail(e))


@router.post("/calculate_dynamic_cost")
async def calculate_dynamic_cost(request: Request):
    try:
        payload = await request.json()
        return await calculate_dynamic_cost_helper(payload)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise HTTPException(
                status_code=e.status_code,
                detail=public_http_exception_detail(e),
                headers=e.headers,
            )
        raise HTTPException(status_code=400, detail=public_exception_detail(e))
