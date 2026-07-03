<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match('/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/', $value)) {
            $fail('La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.');
        }
    }
}
