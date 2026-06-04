using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Suppliers;

public class UpdateSupplierCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class UpdateSupplierCommandValidator : AbstractValidator<UpdateSupplierCommand>
{
    public UpdateSupplierCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).MaximumLength(150);
        RuleFor(x => x.Phone).MaximumLength(50);
        RuleFor(x => x.Address).MaximumLength(500);
    }
}

public class UpdateSupplierCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateSupplierCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await unitOfWork.Suppliers.GetByIdAsync(request.Id, cancellationToken);
        if (supplier == null) throw new NotFoundException("Supplier not found.", "ID");

        supplier.Name = request.Name;
        supplier.Email = request.Email;
        supplier.Phone = request.Phone;
        supplier.Address = request.Address;

        await unitOfWork.Suppliers.UpdateAsync(supplier, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Supplier updated successfully.");
    }
}

