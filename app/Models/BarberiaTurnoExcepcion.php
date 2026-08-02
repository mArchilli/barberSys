<?php

namespace App\Models;

use App\Scopes\BelongsToBarberiaScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarberiaTurnoExcepcion extends Model
{
    use HasFactory;

    // Eloquent pluraliza "Excepcion" en inglés ("excepcions"); hay que fijar
    // el nombre real de la tabla a mano.
    protected $table = 'barberia_turno_excepciones';

    protected $fillable = ['barberia_id', 'date', 'enabled'];

    protected function casts(): array
    {
        return [
            'date'    => 'date:Y-m-d',
            'enabled' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope(new BelongsToBarberiaScope);
    }

    public function barberia(): BelongsTo
    {
        return $this->belongsTo(Barberia::class);
    }
}
