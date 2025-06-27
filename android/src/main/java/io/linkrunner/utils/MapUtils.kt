package io.linkrunner.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

/**
 * Utility functions to convert between React Native types and Kotlin types
 */
object MapUtils {

    /**
     * Convert ReadableMap to Kotlin Map
     */
    fun readableMapToMap(readableMap: ReadableMap): Map<String, Any> {
        val map = mutableMapOf<String, Any>()
        val iterator = readableMap.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            when (readableMap.getType(key)) {
                ReadableType.Null -> map[key] = ""
                ReadableType.Boolean -> map[key] = readableMap.getBoolean(key)
                ReadableType.Number -> map[key] = readableMap.getDouble(key)
                ReadableType.String -> map[key] = readableMap.getString(key) ?: ""
                ReadableType.Map -> map[key] = readableMapToMap(readableMap.getMap(key)!!)
                ReadableType.Array -> map[key] = readableArrayToList(readableMap.getArray(key)!!)
            }
        }
        return map
    }

    /**
     * Convert ReadableArray to Kotlin List
     */
    private fun readableArrayToList(readableArray: ReadableArray): List<Any> {
        val list = mutableListOf<Any>()
        for (i in 0 until readableArray.size()) {
            when (readableArray.getType(i)) {
                ReadableType.Null -> list.add("")
                ReadableType.Boolean -> list.add(readableArray.getBoolean(i))
                ReadableType.Number -> list.add(readableArray.getDouble(i))
                ReadableType.String -> list.add(readableArray.getString(i) ?: "")
                ReadableType.Map -> list.add(readableMapToMap(readableArray.getMap(i)!!))
                ReadableType.Array -> list.add(readableArrayToList(readableArray.getArray(i)!!))
            }
        }
        return list
    }

    /**
     * Convert Kotlin Map to WritableMap
     */
    fun mapToWritableMap(map: Map<String, Any?>?): WritableMap {
        val writableMap = Arguments.createMap()

        if (map == null) {
            return writableMap
        }

        for ((key, value) in map) {
            when (value) {
                null -> writableMap.putNull(key)
                is Boolean -> writableMap.putBoolean(key, value)
                is Int -> writableMap.putInt(key, value)
                is Double -> writableMap.putDouble(key, value)
                is Float -> writableMap.putDouble(key, value.toDouble())
                is String -> writableMap.putString(key, value)
                is Map<*, *> -> {
                    @Suppress("UNCHECKED_CAST")
                    writableMap.putMap(key, mapToWritableMap(value as Map<String, Any?>))
                }
                is List<*> -> {
                    @Suppress("UNCHECKED_CAST")
                    writableMap.putArray(key, listToWritableArray(value as List<Any?>))
                }
                else -> writableMap.putString(key, value.toString())
            }
        }

        return writableMap
    }

    /**
     * Convert Kotlin List to WritableArray
     */
    fun listToWritableArray(list: List<Any?>?): WritableArray {
        val writableArray = Arguments.createArray()

        if (list == null) {
            return writableArray
        }

        for (value in list) {
            when (value) {
                null -> writableArray.pushNull()
                is Boolean -> writableArray.pushBoolean(value)
                is Int -> writableArray.pushInt(value)
                is Double -> writableArray.pushDouble(value)
                is Float -> writableArray.pushDouble(value.toDouble())
                is String -> writableArray.pushString(value)
                is Map<*, *> -> {
                    @Suppress("UNCHECKED_CAST")
                    writableArray.pushMap(mapToWritableMap(value as Map<String, Any?>))
                }
                is List<*> -> {
                    @Suppress("UNCHECKED_CAST")
                    writableArray.pushArray(listToWritableArray(value as List<Any?>))
                }
                else -> writableArray.pushString(value.toString())
            }
        }

        return writableArray
    }

    /**
     * Extension functions for safe retrieval from maps
     */
    inline fun <reified T> Map<String, Any?>.get(key: String, defaultValue: T): T {
        val value = this[key]
        return when {
            value == null -> defaultValue
            value is T -> value
            T::class.java == String::class.java && value != null -> value.toString() as T
            T::class.java == Int::class.java && value is Number -> value.toInt() as T
            T::class.java == Double::class.java && value is Number -> value.toDouble() as T
            T::class.java == Float::class.java && value is Number -> value.toFloat() as T
            T::class.java == Long::class.java && value is Number -> value.toLong() as T
            T::class.java == Boolean::class.java && value is Number -> (value.toInt() != 0) as T
            else -> defaultValue
        }
    }
}
