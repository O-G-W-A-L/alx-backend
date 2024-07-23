#!/usr/bin/env python3
"""Last-In First-Out caching module.
"""
from collections import OrderedDict
from base_caching import BaseCaching


class LIFOCache(BaseCaching):
    """Represents an object that allows storing and
    retrieving items from a dictionary with a LIFO
    removal mechanism when the limit is reached.
    """
    def __init__(self):
        """Initializes the cache.
        """
        super().__init__()
        self.cache_data = OrderedDict()

    def put(self, key, item):
        """Adds an item in the cache
        Args:
            key (str): The key under which the item will be stored.
            item (any): The item to be stored in the cache
        Returns:
            None: If either key or item is None, the method does nothing.
        """
        if key is None or item is None:
            return
        if key not in self.cache_data:
            if len(self.cache_data) + 1 > BaseCaching.MAX_ITEMS:
                last_key, _ = self.cache_data.popitem(True)
                print("DISCARD:", last_key)
        self.cache_data[key] = item
        self.cache_data.move_to_end(key, last=True)

    def get(self, key):
        """Retrieves an item by key from the cache
        Args:
            key (str): The key corresponding to the item to be retrieved
        Returns:
            any: The item stored in the cache with the specified key.
            None: If the key is None or the key does not exist in the cache.
        """
        return self.cache_data.get(key, None)
