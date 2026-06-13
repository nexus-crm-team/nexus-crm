using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Entities;

namespace NexusCRM.Web.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // TODO: Set<T>-ով փորձլ |
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Deal> Deals { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<WorkTask> Tasks { get; set; }

    public DbSet<Note> Notes { get; set; }
    public DbSet<FollowUp> FollowUps { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var fk in modelBuilder.Model.GetEntityTypes().SelectMany(t => t.GetForeignKeys()))
            fk.DeleteBehavior = DeleteBehavior.Restrict;

        modelBuilder.Entity<Company>()
            .OwnsOne(c => c.Address);

        modelBuilder.Entity<Customer>()
            .OwnsOne(c => c.Address);

        modelBuilder.Entity<Company>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<Company>()
            .HasIndex(x => x.PhoneNumber)
            .IsUnique();

        modelBuilder.Entity<Company>()
            .HasIndex(c => c.Name)
            .IsUnique();
        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email)
            .IsUnique();

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.PhoneNumber)
            .IsUnique();
    }
}
