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
        // Must be 10 or more numbers/hyphens long
        $regex = '/^([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}$/';

        return (preg_match($regex, $tel) !== 0);
    }

    public static function MultTelNos($multTel) {
        // Must be 10 or more numbers/hyphens long. And each number must be separated by a comma and a space
        $regex = '/^([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}(,\s([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4})*$/';

        return (preg_match($regex, $multTel) !== 0);
    }

    public static function Image($image) {
        if ( !is_array($image) ) return false;
        if ( empty($image["tmp_name"]) ) return true;

        // When an expression is prepended with the @ sign, error messages that might be generated by that expression will be ignored.
        if (@getimagesize($image["tmp_name"]) === false) return false;
        
        if ($image["size"] > 40000000) return false; // 38.15MB

        $type = strtolower( pathinfo("uploads/" . basename($image["name"]), PATHINFO_EXTENSION) );
        $validTypes = array('tif', 'pjp', 'xbm', 'jxl', 'svgz', 'jpg', 'jpeg', 'ico', 'tiff', 'gif', 'svg', 'jfif', 'webp', 'png', 'bmp', 'pjpeg', 'avif');

        return (array_search($type, $validTypes, true) !== false);
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

    public static function Quantity($quantity) {
        if ( !is_numeric($quantity) ) return false;
        if ($quantity < 0.25) return false;
        
        return true;
    }

    public static function Quantities($quantities) {
        if ( !is_array($quantities) ) return false;
        if (count($quantities) === 0) return false;

        foreach($quantities as $quantity) {
            if ( !self::Quantity($quantity) ) return false;
        }

        return true;
    }
} // class Validate

class Format {
    public static function roundToFraction($number, $denominator) {
        $result = $number * $denominator;
        $result = round($result);
        $result = $result / $denominator;
        return $result;
    }

    public static function UnitPrice($unitPrice = "0.01") {
        $unitPrice = self::roundToFraction($unitPrice, 100);
        $hasDecimal = strpos($unitPrice, '.');

        if (!$hasDecimal) return $unitPrice . ".00";
        else {
            if ( $hasDecimal === (strlen($unitPrice) - 2) ) return $unitPrice . "0";
        }

        return $unitPrice;
    }

    public static function Quantity($quantity = "0.25") {
        $quantity = self::roundToFraction($quantity, 4);
        $hasDecimal = strpos($quantity, '.');

        if (!$hasDecimal) return $quantity . ".00";
        else {
            if ( $hasDecimal === (strlen($quantity) - 2) ) return $quantity . "0";
        }

        return $quantity;
    }

    public static function Quantities($quantities = array()) {
        for ($i = 0; $i < count($quantities); $i++) {
            $quantities[$i] = self::Quantity($quantities[$i]);
        }

        return $quantities;
    }
} // class Format