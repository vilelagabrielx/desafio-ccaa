using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FluentValidation;
using Mapster;
using System.Reflection;
using DesafioCCAA.Business.Interfaces;
using DesafioCCAA.Business.Services;
using DesafioCCAA.Business.Validators;
using DesafioCCAA.Infrastructure.Data;
using DesafioCCAA.Infrastructure.Repositories;
using DesafioCCAA.Business.Entities;
using Microsoft.AspNetCore.Identity;
using DotNetEnv;

// Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Desafio CCAA API", 
        Version = "v1",
        Description = "API para gerenciamento de livros com autenticação Auth0/JWT"
    });

    // Configure authentication for Swagger
    var auth0Settings = builder.Configuration.GetSection("Auth0");
    if (!string.IsNullOrEmpty(auth0Settings["Domain"]))
    {
        // Auth0 Configuration for Swagger
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.OAuth2,
            Flows = new OpenApiOAuthFlows
            {
                Implicit = new OpenApiOAuthFlow
                {
                    AuthorizationUrl = new Uri($"{auth0Settings["Issuer"]}authorize"),
                    TokenUrl = new Uri($"{auth0Settings["Issuer"]}oauth/token"),
                    Scopes = new Dictionary<string, string>
                    {
                        { "openid", "OpenID" },
                        { "profile", "Profile" },
                        { "email", "Email" }
                    }
                }
            }
        });
    }
    else
    {
        // JWT Configuration for Swagger (fallback)
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
    }

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database Configuration
var dbProvider = Environment.GetEnvironmentVariable("DB_PROVIDER") ?? 
                 builder.Configuration["Database:Provider"] ?? 
                 "PostgreSQL";

// Debug: Check which configuration files are loaded
Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"Content Root: {builder.Environment.ContentRootPath}");
Console.WriteLine($"Application Name: {builder.Environment.ApplicationName}");

// List all configuration sources
Console.WriteLine("Configuration sources:");
Console.WriteLine($"  - Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"  - Content Root: {builder.Environment.ContentRootPath}");

// Build connection string from configuration or environment variables
var connectionString = builder.Configuration.GetConnectionString("PostgreSQL");
Console.WriteLine($"Connection string from config: {connectionString}");

if (string.IsNullOrEmpty(connectionString))
{
    // Fallback to environment variables if no connection string in config
    connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
    if (string.IsNullOrEmpty(connectionString))
    {
        var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
        var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
        var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "postgres";
        var dbUsername = Environment.GetEnvironmentVariable("DB_USERNAME") ?? "postgres";
        var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";
        
        if (dbProvider.ToLower() == "postgresql" || dbProvider.ToLower() == "postgres")
        {
            connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUsername};Password={dbPassword};";
        }
        else if (dbProvider.ToLower() == "sqlserver" || dbProvider.ToLower() == "mssql")
        {
            connectionString = builder.Configuration.GetConnectionString("SQLServer");
        }
    }
}

Console.WriteLine($"Using Database Provider: {dbProvider}");
Console.WriteLine($"Connection String: {connectionString?.Substring(0, Math.Min(50, connectionString?.Length ?? 0))}...");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    switch (dbProvider.ToLower())
    {
        case "postgresql":
        case "postgres":
            options.UseNpgsql(connectionString);
            break;
        case "sqlserver":
        case "mssql":
            options.UseSqlServer(connectionString);
            break;
        default:
            throw new InvalidOperationException($"Unsupported database provider: {dbProvider}");
    }
});

// Identity Configuration
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>();

// Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var auth0Settings = builder.Configuration.GetSection("Auth0");

// Use Auth0 if configured, otherwise fall back to local JWT
if (!string.IsNullOrEmpty(auth0Settings["Domain"]))
{
    // Auth0 Configuration
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Authority = auth0Settings["Issuer"];
        options.Audience = auth0Settings["Audience"];
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = auth0Settings["Issuer"],
            ValidAudience = auth0Settings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
}
else
{
    // Local JWT Configuration (fallback)
    var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "DefaultKeyForDevelopmentOnly");
    
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
}

// Authorization
builder.Services.AddAuthorization();

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<UserRegistrationDtoValidator>();

// Mapster Configuration
TypeAdapterConfig.GlobalSettings.Scan(Assembly.GetExecutingAssembly());

// Repository Registration
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();

// Service Registration
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBookService, BookService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Desafio CCAA API V1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at root
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
