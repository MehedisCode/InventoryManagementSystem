using IMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IMS.Infrastructure.Persistence.Configurations
{
    public class SaleReturnItemConfiguration : IEntityTypeConfiguration<SaleReturnItem>
    {
        public void Configure(EntityTypeBuilder<SaleReturnItem> builder)
        {
            builder.HasOne(sri => sri.SaleReturn)
                .WithMany(sr => sr.SaleReturnItems)
                .HasForeignKey(sri => sri.SaleReturnId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
