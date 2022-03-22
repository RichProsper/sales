<?php

class DB {
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
            $filters[$i]->filterValue = self::escapeString($filters[$i]->filterValue);
        }

        return $filters;
    }

    public static function sanitizeLimit($limit = 0, $default = 5) {
        if ( is_int($limit) ) {
            if ($limit >= $default) return $limit;
        }

        return $default;
    }

    public static function sanitizeOffset($offset = 0, $default = 0) {
        if ( is_int($offset) ) {
            if ($offset >= $default) return $offset;
        }

        return $default;
    }

    public static function sanitizeSorts($sorts = array()) {
        for ($i = 0; $i < count($sorts); $i++) {
            // Column
            $sorts[$i]->column = preg_replace('/[^A-Za-z0-9_]/', '', $sorts[$i]->column);

            // Direction
            if ($sorts[$i]->direction !== "ASC" && $sorts[$i]->direction !== "DESC") $sorts[$i]->direction = "ASC";
        }

        return $sorts;
    }

    public static function escapeString($str) {
        return htmlspecialchars( addslashes( str_replace( "\\", "", trim($str) ) ) );
    }
} // class DB

class Validate {
    public static function ID($id) {
        if ( !is_int($id) ) return false;
        if ($id < 1) return false;
        
        return true;
    }

    public static function IDs($ids) {
        if ( !is_array($ids) ) return false;
        if (count($ids) === 0) return false;
        
        foreach($ids as $id) {
            if ( !self::ID($id) ) return false;
        }

        return true;
    }

    public static function Title($title) {
        $validTitles = array('Dr.', 'Miss', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Rev.');

        return (array_search($title, $validTitles, true) !== false);
    }

    public static function Name($name) {
        // Only letters, hyphens and spaces allowed
        $regex = '/^[A-Za-z\-\s]{1,}$/';
        
        return (preg_match($regex, $name) !== 0);
    }

    public static function Email($email) {
        return (filter_var($email, FILTER_VALIDATE_EMAIL) !== false);
    }

    public static function Parish($parish) {
        $validParishes = array('Christ Church', 'St. Andrew', 'St. George', 'St. James', 'St. John', 'St. Joseph', 'St. Lucy', 'St. Michael', 'St. Peter', 'St. Philip', 'St. Thomas');

        return (array_search($parish, $validParishes, true) !== false);
    }

    public static function TelNo($tel) {
        $regex = '/^([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}$/';

        return (preg_match($regex, $tel) !== 0);
    }

    public static function MultTelNos($multTel) {
        $regex = '/^([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}(,\s([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4})*$/';

        return (preg_match($regex, $multTel) !== 0);
    }

    // TODO
    public static function Image($image) {
        return true;
    }

    public static function Unit($unit) {
        $validUnits = array('Kilograms (kg)', 'Grams (g)', 'Pounds (lbs)', 'Ounces (oz)');

        return (array_search($unit, $validUnits, true) !== false);
    }

    public static function UnitPrice($unitPrice) {
        if ( !is_numeric($unitPrice) ) return false;
        if ($unitPrice < 0.01) return false;
        
        return true;
    }
} // class Validate

class Format {
    public static function UnitPrice($unitPrice = "0.01") {
        $unitPrice = round($unitPrice, 2);
        $hasDecimal = strpos($unitPrice, '.');

        if (!$hasDecimal) return $unitPrice . ".00";
        else {
            if ( $hasDecimal === (strlen($unitPrice) - 2) ) return $unitPrice . "0";
        }

        return $unitPrice;
    }
} // class Format