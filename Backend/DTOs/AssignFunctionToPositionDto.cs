namespace Backend.DTOs;

internal sealed record AssignFunctionToPositionDto(int IdFuncion)
{
    public string? Validar() => IdFuncion <= 0 ? "El ID de función debe ser un número positivo." : null;
}