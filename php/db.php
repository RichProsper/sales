<?php

class db {
    public static function getDbConnection() {
        try {
            $connString = "mysql:host=localhost;dbname=sales_db";
            $user = "root";
            $pass = "";
            $conn = new PDO($connString, $user, $pass);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        catch (PDOException $e) {
            $conn = null;
            die($e->getMessage());
        }
        return $conn;
    }

    public static function sanitizeFilters($filters = array()) {
        for ($i = 0; $i < count($filters); $i++) {
            // Operator
            if ($filters[$i]->operator !== false && $filters[$i]->operator !== "AND" && $filters[$i]->operator !== "OR") $filters[$i]->operator = false;

            // Column
            $filters[$i]->column = preg_replace('/[^A-Za-z0-9_]/', '', $filters[$i]->column);

            // Operation
            $validOperations = array('=', '!=', '>', '>=', '<', '<=', 'contain', 'startWith', 'endWith', 'isEmpty', 'isNotEmpty');
            
            if ( !array_search($filters[$i]->operation, $validOperations, true) ) $filters[$i]->operation = '=';

            // Filter Value
            $filters[$i]->filterValue = filter_var($filters[$i]->filterValue, FILTER_SANITIZE_SPECIAL_CHARS, FILTER_FLAG_STRIP_HIGH);
        }

        return $filters;
    }
} // class db