from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class IpcBnsMapping(Base):
    __tablename__ = "ipc_bns_mapping"

    id: Mapped[int] = mapped_column(primary_key=True)
    ipc_section: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    bns_section: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text)
    notes: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

