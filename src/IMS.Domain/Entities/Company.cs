using IMS.Domain.Common;

namespace IMS.Domain.Entities
{
    public class Company : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        
        public Guid CurrencyId { get; set; }
        public Currency Currency { get; set; } = null!;
    }
}
