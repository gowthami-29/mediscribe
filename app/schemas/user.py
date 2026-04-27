from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str
    license_number: str
    organization_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str