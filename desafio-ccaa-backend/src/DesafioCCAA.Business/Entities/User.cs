using Microsoft.AspNetCore.Identity;

namespace DesafioCCAA.Business.Entities;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Auth0Id { get; set; } // ID único do Auth0
    public DateTime DateOfBirth { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<Book> Books { get; set; } = [];
    
    public string FullName => $"{FirstName} {LastName}".Trim();
}
