#!/usr/bin/env python3
"""Basic caching module.
"""
from base_caching import BaseCaching

class BasicCache(BaseCaching):
    """Represents an object that allows storing and
    retrieving items from a dictionary without any limit.
    """

    def put(self, key, item):
        """Adds an item in the cache.
        
        Args:
            key (str): The key under which the item will be stored.
            item (any): The item to be stored in the cache.
        
        Returns:
            None: If either key or item is None, the method does nothing.
        """
        if key is None or item is None:
            return
        self.cache_data[key] = item

    def get(self, key):
        """Retrieves an item by key from the cache.
        
        Args:
            key (str): The key corresponding to the item to be retrieved.
        
        Returns:
            any: The item stored in the cache with the specified key.
            None: If the key is None or the key does not exist in the cache.
        """
        return self.cache_data.get(key, None)
