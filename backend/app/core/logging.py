import logging
import sys
import time
import json
from typing import Any
from .config import settings

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        
        # Merge dictionary objects from extra keys
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data
            
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logging():
    logger = logging.getLogger()
    
    # Configure custom formatting levels
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logger.setLevel(level)
    
    # Console stream handler configuration
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    
    # Clear preexisting handlers
    logger.handlers = [handler]
    
    # Silence default noisy engines
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

def log_event(name: str, message: str, level: str = "info", extra: Any = None):
    setup_logging()
    logger = logging.getLogger(name)
    extra_dict = {"extra_data": extra} if extra else {}
    
    log_func = getattr(logger, level.lower(), logger.info)
    log_func(message, extra=extra_dict)
