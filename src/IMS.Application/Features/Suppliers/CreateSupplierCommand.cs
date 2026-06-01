using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using MediatR;

namespace IMS.Application.Features.Suppliers
{
    public class CreateSupplierCommand : IRequest<ApiResponse<Guid>>
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class CreateSupplierCommandValidator : AbstractValidator<CreateSupplierCommand>
    {
        public CreateSupplierCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Email).MaximumLength(150);
            RuleFor(x => x.Phone).MaximumLength(50);
            RuleFor(x => x.Address).MaximumLength(500);
        }
    }

    public class CreateSupplierCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateSupplierCommand, ApiResponse<Guid>>
    {
        public async Task<ApiResponse<Guid>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
        {
            var supplier = new Supplier
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address
            };

            await unitOfWork.Suppliers.AddAsync(supplier, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.SuccessResponse(supplier.Id, "Supplier created successfully.");
        }
    }
}
