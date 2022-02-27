<?php

class Validate {
    public static function validateTitle($title = '') {
        $validTitles = array('Dr.', 'Miss', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Rev.');

        return (array_search($title, $validTitles, true) !== false);
    }

    public static function validateName($name = '') {
        // Minimums: 'Ti' or 'Ja-Ze'
        $regex = '/^([A-Z][a-z]{1,}|[A-Z][a-z]{1,}-[A-Z][a-z]{1,})$/';
        
        return (preg_match($regex, $name) !== 0);
    }

    public static function validateEmail($email = '') {
        return (filter_var($email, FILTER_VALIDATE_EMAIL) !== false);
    }

    public static function validateParish($parish = '') {
        $validParishes = array('Christ Church', 'St. Andrew', 'St. George', 'St. James', 'St. John', 'St. Joseph', 'St. Lucy', 'St. Michael', 'St. Peter', 'St. Philip', 'St. Thomas');

        return (array_search($parish, $validParishes, true) !== false);
    }

    public static function validateTel($tel = '') {
        $regex = '/^([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}$/';

        return (preg_match($regex, $tel) !== 0);
    }

    public static function validateMultTel($multTel = '') {
        $regex = '/^([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4}(,\s([0-9]{1,3}|1-[0-9]{3})-[0-9]{3,4}-[0-9]{4})*$/';

        return (preg_match($regex, $multTel) !== 0);
    }
} // class Validate