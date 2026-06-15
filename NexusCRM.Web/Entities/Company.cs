using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities
{
    public class Company
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(30)]
        public string? Industry { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [Phone]
        public string? PhoneNumber { get; set; }

        [Required]
        public Address? Address { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public DateOnly FoundedDate { get; set; } = DateOnly.FromDateTime(DateTime.Now);

        public ICollection<Customer> Customers { get; set; } = new List<Customer>();

        public ICollection<Deal> Deals { get; set; } = new List<Deal>();
    }
}
