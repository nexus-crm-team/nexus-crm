using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Implementations;
using NexusCRM.Web.Repositories.Interfaces;
using NexusCRM.Web.Services.Implementations;
using NexusCRM.Web.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//
//builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IDealRepository, DealRepository>();
builder.Services.AddScoped<IFollowUpRepository, FollowUpRepository>();
builder.Services.AddScoped<INoteRepository, NoteRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWorkTaskRepository, WorkTaskRepository>();

builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IDealService, DealService>();
builder.Services.AddScoped<IFollowUpService, FollowUpService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<IWorkTaskService, WorkTaskService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddIdentityCore<User>(
    options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = false;
        options.User.RequireUniqueEmail = true;
    }).AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddCors(options =>
    options.AddPolicy("AllowClient", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// Configure the HTTP request pipeline.
//app.MapOpenApi();
//app.UseSwagger();
//app.UseSwaggerUI();
//app.UseSwaggerUI(options =>
//{
//    options.SwaggerEndpoint("/swagger/v1/swagger.json", "NexusCRM.Web v1");
//    options.RoutePrefix = string.Empty;
//});

app.UseHttpsRedirection();

app.UseCors("AllowClient");

app.UseAuthorization();

app.MapControllers();

//TODO
//app.UseExceptionHandler();

app.Run();
