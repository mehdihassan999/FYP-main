# utilities: vendor lookup, helper formatting
from mac_vendor_lookup import MacLookup

_mac = MacLookup()

def safe_vendor_lookup(mac: str) -> str:
    try:
        return _mac.lookup(mac)
    except Exception:
        return "Unknown"