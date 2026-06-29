// ServiceCollectionExtensions.cs
using Backend.Middleware;
using Backend.Repositories;
using Backend.Services;
using Oracle.ManagedDataAccess.Client;

namespace Backend.Extensions;

/// <summary>
/// Configuración de Oracle y registro de la inyección de dependencias. Aísla del archivo
/// de arranque la composición de servicios para mantener Program.cs mínimo.
/// </summary>
internal static class ServiceCollectionExtensions
{
    public static void AddOracle(this WebApplicationBuilder builder)
    {
        var walletPath = Path.GetFullPath(
            Path.Combine(builder.Environment.ContentRootPath,
                builder.Configuration["Oracle:WalletPath"] ?? "wallet"));

        try { OracleConfiguration.TnsAdmin = walletPath; }
        catch (InvalidOperationException) { /* ODP.NET solo permite fijar TnsAdmin una vez por proceso; se ignora si ya fue configurado. */ }

        try { OracleConfiguration.WalletLocation = walletPath; }
        catch (InvalidOperationException) { /* Ídem para WalletLocation. */ }
    }

    public static void AddApplicationServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;

        services.AddScoped(_ =>
            new OracleConnection(builder.Configuration.GetConnectionString("OracleDB")));
        services.AddScoped<IDbExecutor, OracleDbExecutor>();
        services.AddScoped<IQueryExecutor, OracleQueryExecutor>();
        services.AddScoped<IUserRepository>(sp =>
            new UserRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IAreaRepository>(sp =>
            new AreaRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IDepartmentRepository>(sp =>
            new DepartmentRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<ISectionRepository>(sp =>
            new SectionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IUnitRepository>(sp =>
            new UnitRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IPositionRepository>(sp =>
            new PositionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IPositionAssignmentRepository>(sp =>
            new PositionAssignmentRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IWorkPositionRepository>(sp =>
            new WorkPositionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IWorkPositionFunctionRepository>(sp =>
            new WorkPositionFunctionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IFunctionRepository>(sp =>
            new FunctionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IUserFunctionRepository>(sp =>
            new UserFunctionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IDeclaracionRepository>(sp =>
            new DeclaracionRepository(sp.GetRequiredService<IQueryExecutor>()));
        services.AddScoped<IDeclaracionService, DeclaracionService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddOpenApi();
        services.AddCors(options =>
            options.AddPolicy("FrontendOrigin", policy =>
                policy.WithOrigins("http://localhost:5173")
                      .AllowAnyMethod()
                      .AllowAnyHeader()));
    }
}
