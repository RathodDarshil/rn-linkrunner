package io.linkrunner.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MapUtils {

    /**
     * Convert ReadableMap to Java Map
     */
    public static Map<String, Object> readableMapToMap(ReadableMap readableMap) {
        Map<String, Object> map = new HashMap<>();

        if (readableMap == null) {
            return map;
        }

        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();

        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableType type = readableMap.getType(key);

            switch (type) {
                case Null:
                    map.put(key, null);
                    break;
                case Boolean:
                    map.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    map.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    map.put(key, readableMap.getString(key));
                    break;
                case Map:
                    map.put(key, readableMapToMap(readableMap.getMap(key)));
                    break;
                case Array:
                    map.put(key, readableArrayToList(readableMap.getArray(key)));
                    break;
                default:
                    throw new IllegalArgumentException("Could not convert object with key: " + key + ".");
            }
        }

        return map;
    }

    /**
     * Convert ReadableArray to Java List
     */
    public static List<Object> readableArrayToList(ReadableArray readableArray) {
        List<Object> list = new ArrayList<>();

        if (readableArray == null) {
            return list;
        }

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableType type = readableArray.getType(i);

            switch (type) {
                case Null:
                    list.add(null);
                    break;
                case Boolean:
                    list.add(readableArray.getBoolean(i));
                    break;
                case Number:
                    list.add(readableArray.getDouble(i));
                    break;
                case String:
                    list.add(readableArray.getString(i));
                    break;
                case Map:
                    list.add(readableMapToMap(readableArray.getMap(i)));
                    break;
                case Array:
                    list.add(readableArrayToList(readableArray.getArray(i)));
                    break;
                default:
                    throw new IllegalArgumentException("Could not convert object at index " + i + ".");
            }
        }

        return list;
    }

    /**
     * Convert Java Map to WritableMap
     */
    public static WritableMap mapToWritableMap(Map<String, Object> map) {
        WritableMap writableMap = Arguments.createMap();

        if (map == null) {
            return writableMap;
        }

        for (Map.Entry<String, Object> entry : map.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();

            if (value == null) {
                writableMap.putNull(key);
            } else if (value instanceof Boolean) {
                writableMap.putBoolean(key, (Boolean) value);
            } else if (value instanceof Integer) {
                writableMap.putInt(key, (Integer) value);
            } else if (value instanceof Double) {
                writableMap.putDouble(key, (Double) value);
            } else if (value instanceof Float) {
                writableMap.putDouble(key, ((Float) value).doubleValue());
            } else if (value instanceof String) {
                writableMap.putString(key, (String) value);
            } else if (value instanceof Map) {
                writableMap.putMap(key, mapToWritableMap((Map<String, Object>) value));
            } else if (value instanceof List) {
                writableMap.putArray(key, listToWritableArray((List<Object>) value));
            } else {
                writableMap.putString(key, value.toString());
            }
        }

        return writableMap;
    }

    /**
     * Convert Java List to WritableArray
     */
    public static WritableArray listToWritableArray(List<Object> list) {
        WritableArray writableArray = Arguments.createArray();

        if (list == null) {
            return writableArray;
        }

        for (Object value : list) {
            if (value == null) {
                writableArray.pushNull();
            } else if (value instanceof Boolean) {
                writableArray.pushBoolean((Boolean) value);
            } else if (value instanceof Integer) {
                writableArray.pushInt((Integer) value);
            } else if (value instanceof Double) {
                writableArray.pushDouble((Double) value);
            } else if (value instanceof Float) {
                writableArray.pushDouble(((Float) value).doubleValue());
            } else if (value instanceof String) {
                writableArray.pushString((String) value);
            } else if (value instanceof Map) {
                writableArray.pushMap(mapToWritableMap((Map<String, Object>) value));
            } else if (value instanceof List) {
                writableArray.pushArray(listToWritableArray((List<Object>) value));
            } else {
                writableArray.pushString(value.toString());
            }
        }

        return writableArray;
    }

    /**
     * Safely get String value from Map
     */
    public static String getStringFromMap(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value instanceof String ? (String) value : defaultValue;
    }

    /**
     * Safely get Integer value from Map
     */
    public static Integer getIntFromMap(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value instanceof Integer) {
            return (Integer) value;
        } else if (value instanceof Double) {
            return ((Double) value).intValue();
        }
        return defaultValue;
    }

    /**
     * Safely get Double value from Map
     */
    public static Double getDoubleFromMap(Map<String, Object> map, String key, Double defaultValue) {
        Object value = map.get(key);
        if (value instanceof Double) {
            return (Double) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).doubleValue();
        }
        return defaultValue;
    }

    /**
     * Safely get Boolean value from Map
     */
    public static Boolean getBooleanFromMap(Map<String, Object> map, String key, Boolean defaultValue) {
        Object value = map.get(key);
        return value instanceof Boolean ? (Boolean) value : defaultValue;
    }
}
