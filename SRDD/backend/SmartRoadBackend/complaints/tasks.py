"""
Background tasks (legacy support — also used by scheduler.py).
"""
import logging

logger = logging.getLogger(__name__)


def run_escalation_check():
    """Delegated to scheduler to avoid circular imports."""
    from .scheduler import run_escalation_check as _check
    _check()