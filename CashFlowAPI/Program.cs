using CashFlowAPI.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy => {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyMethod()                     
              .AllowAnyHeader();                    
    });
});

builder.Services.AddDbContext<DataContext>(options =>
    options.UseSqlite("Data Source=cashflow.db"));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();
app.UseCors("AllowReact");
app.MapControllers();

app.Run();