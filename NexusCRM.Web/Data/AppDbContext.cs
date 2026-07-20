using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Entities;
using System.Security.Claims;

namespace NexusCRM.Web.Data;

public class AppDbContext : IdentityUserContext<User>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        IHttpContextAccessor httpContextAccessor) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private int? CurrentCompanyId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User
                .FindFirstValue("companyId");

            return int.TryParse(value, out var companyId) ? companyId : null;
        }
    }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<Deal> Deals { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<WorkTask> Tasks { get; set; }
    public DbSet<Note> Notes { get; set; }
    public DbSet<FollowUp> FollowUps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var fk in modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetForeignKeys()))
        {
            if (!fk.IsOwnership)
                fk.DeleteBehavior = DeleteBehavior.Restrict;
        }

        modelBuilder.Entity<Company>().OwnsOne(c => c.Address);
        modelBuilder.Entity<Customer>().OwnsOne(c => c.Address);

        modelBuilder.Entity<Company>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<Company>().HasIndex(x => x.PhoneNumber).IsUnique();
        modelBuilder.Entity<Company>().HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<Customer>().HasIndex(c => c.Email).IsUnique();
        modelBuilder.Entity<Customer>().HasIndex(c => c.PhoneNumber).IsUnique();

        modelBuilder.Entity<Deal>()
            .Property(d => d.EstimatedValue)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Company>()
            .HasQueryFilter(company =>
                CurrentCompanyId == null || company.Id == CurrentCompanyId);

        modelBuilder.Entity<Customer>()
            .HasQueryFilter(customer =>
                CurrentCompanyId == null || customer.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<Deal>()
            .HasQueryFilter(deal =>
                CurrentCompanyId == null || deal.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<User>()
            .HasQueryFilter(user =>
                CurrentCompanyId == null || user.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<Note>()
            .HasQueryFilter(note =>
                CurrentCompanyId == null || note.Author!.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<WorkTask>()
            .HasQueryFilter(task =>
                CurrentCompanyId == null || task.Deal!.CompanyId == CurrentCompanyId);

        modelBuilder.Entity<FollowUp>()
            .HasQueryFilter(followUp =>
                CurrentCompanyId == null || followUp.Deal!.CompanyId == CurrentCompanyId);
    }
}
