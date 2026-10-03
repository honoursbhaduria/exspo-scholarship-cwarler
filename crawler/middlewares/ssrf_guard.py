import ipaddress
import socket
from urllib.parse import urlparse
from typing import Tuple

FORBIDDEN_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

class SSRFGuard:
    @classmethod
    def validate_url(cls, url: str) -> Tuple[bool, str]:
        """
        Validates URL scheme and resolves destination IP to ensure it does not
        hit internal, private, loopback, or cloud-metadata addresses.
        """
        try:
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https"):
                return False, f"Invalid protocol scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

            hostname = parsed.hostname
            if not hostname:
                return False, "URL does not contain a valid hostname."

            # Block common internal hostname aliases
            if hostname.lower() in ("localhost", "metadata.google.internal", "instance-data"):
                return False, f"Prohibited internal hostname '{hostname}'."

            # Resolve hostname to IP address
            addr_info = socket.getaddrinfo(hostname, None)
            for info in addr_info:
                ip_str = info[4][0]
                ip_obj = ipaddress.ip_address(ip_str)

                for net in FORBIDDEN_NETWORKS:
                    if ip_obj in net:
                        return False, f"Destination IP {ip_str} falls within forbidden network {net} (SSRF block)."

            return True, "URL is safe to fetch."
        except socket.gaierror:
            # Domain cannot be resolved
            return False, f"DNS resolution failed for hostname '{parsed.hostname}'."
        except Exception as e:
            return False, f"SSRF validation exception: {str(e)}"
