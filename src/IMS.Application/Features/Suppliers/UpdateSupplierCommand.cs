using FluentValidation;
using IMS.Application.Common;
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

public class UpdateSupplierCommandHandler : IRequestHandler<UpdateSupplierCommand, ApiResponse<bool>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSupplierCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(request.Id, cancellationToken);
        if (supplier == null) return ApiResponse<bool>.ErrorResponse("Supplier not found.");

        supplier.Name = request.Name;
        supplier.Email = request.Email;
        supplier.Phone = request.Phone;
        supplier.Address = request.Address;

        await _unitOfWork.Suppliers.UpdateAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Supplier updated successfully.");
    }
}
