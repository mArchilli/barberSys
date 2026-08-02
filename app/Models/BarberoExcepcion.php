<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarberoExcepcion extends Model
{
    use HasFactory;

    // Eloquent pluraliza "Excepcion" en inglés ("excepcions"); hay que fijar
    // el nombre real de la tabla a mano.
    protected $table = 'barbero_excepciones';

    protected $fillable = ['user_id', 'fecha', 'disponible', 'motivo'];

    protected function casts(): array
    {
        return [
            'fecha'      => 'date:Y-m-d',
            'disponible' => 'boolean',
        ];
    }

    public function barbero(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
