using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

[Owned]
public class Address
{
    public string? Line1 { get; set; }
    public string? Line2 { get; set; }

    [Required]
    public string? City { get; set; }
    public string? PostalCode { get; set; }

    [Required]
    public string? Country { get; set; }
}
