using System;
using System.Linq.Expressions;
using IMS.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace IMS.Infrastructure.Persistence.Extensions
{
    public static class ModelBuilderExtensions
    {
        public static void ApplyGlobalConcepts(this ModelBuilder builder)
        {
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    builder.Entity(entityType.ClrType).HasQueryFilter(GetIsDeletedRestriction(entityType.ClrType));
                }

                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                    {
                        property.SetPrecision(18);
                        property.SetScale(2);
                    }
                }
            }
        }

        private static LambdaExpression GetIsDeletedRestriction(Type type)
        {
            var param = Expression.Parameter(type, "it");
            var prop = Expression.Property(param, nameof(BaseEntity.IsDeleted));
            var condition = Expression.MakeBinary(ExpressionType.Equal, prop, Expression.Constant(false));
            return Expression.Lambda(condition, param);
        }
    }
}
