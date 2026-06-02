using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Quotations;

public class UpdateQuotationCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal Discount { get; set; }
    public string Note { get; set; } = string.Empty;
    public QuotationStatus Status { get; set; }
    public List<QuotationItemInputDto> Items { get; set; } = new();
}

public class UpdateQuotationCommandValidator : AbstractValidator<UpdateQuotationCommand>
{
    public UpdateQuotationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.QuotationDate).NotEmpty();
        RuleFor(x => x.ExpiryDate).NotEmpty().GreaterThanOrEqualTo(x => x.QuotationDate);
        RuleFor(x => x.Discount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Quotation must have at least one item.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
        });
    }
}

public class UpdateQuotationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateQuotationCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateQuotationCommand request, CancellationToken cancellationToken)
    {
        var quotation = await unitOfWork.Quotations.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (quotation == null)
            return ApiResponse<bool>.ErrorResponse("Quotation not found.");

        if (quotation.Status == QuotationStatus.Accepted)
            return ApiResponse<bool>.ErrorResponse("Accepted quotations cannot be updated.");

        var customer = await unitOfWork.Customers.GetByIdAsync(request.CustomerId, cancellationToken);
        if (customer == null)
            return ApiResponse<bool>.ErrorResponse("Customer not found.");

        quotation.QuotationItems.Clear();
        var totalAmount = 0m;

        foreach (var itemDto in request.Items)
        {
            var subTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += subTotal;

            quotation.QuotationItems.Add(new QuotationItem
            {
                QuotationId = quotation.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                SubTotal = subTotal
            });
        }

        quotation.CustomerId = request.CustomerId;
        quotation.QuotationDate = request.QuotationDate;
        quotation.ExpiryDate = request.ExpiryDate;
        quotation.TotalAmount = totalAmount;
        quotation.Discount = request.Discount;
        quotation.Note = request.Note;
        quotation.Status = request.Status;

        await unitOfWork.Quotations.UpdateAsync(quotation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Quotation updated successfully.");
    }
}
