using IMS.Domain.Common;

namespace IMS.Domain.Entities
{
    public class Currency : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
    }
}
