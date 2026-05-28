using IMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IMS.Infrastructure.Persistence.Configurations
{
    public class SaleReturnConfiguration : IEntityTypeConfiguration<SaleReturn>
    {
        public void Configure(EntityTypeBuilder<SaleReturn> builder)
        {
            builder.HasOne(sr => sr.Sale)
                .WithMany()
                .HasForeignKey(sr => sr.SaleId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
