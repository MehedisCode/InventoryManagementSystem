using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using IMS.Domain.Enums;
using MediatR;

namespace IMS.Application.Features.Quotations;

public class CreateQuotationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid CustomerId { get; set; }
    public DateTime QuotationDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal Discount { get; set; }
    public string Note { get; set; } = string.Empty;
    public QuotationStatus Status { get; set; }
    public List<QuotationItemInputDto> Items { get; set; } = new();
}

public class CreateQuotationCommandValidator : AbstractValidator<CreateQuotationCommand>
{
    public CreateQuotationCommandValidator()
    {
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

public class CreateQuotationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateQuotationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateQuotationCommand request, CancellationToken cancellationToken)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(request.CustomerId, cancellationToken);
        if (customer == null)
            throw new NotFoundException("Customer not found.", "ID");

        var totalAmount = 0m;
        var quotationItems = new List<QuotationItem>();

        foreach (var itemDto in request.Items)
        {
            var subTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += subTotal;

            quotationItems.Add(new QuotationItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                SubTotal = subTotal
            });
        }

        var today = DateTime.UtcNow;
        var count = await unitOfWork.Quotations.CountAsync(q => q.CreatedAt.Date == today.Date, cancellationToken);
        var referenceNo = $"QUO-{today:yyyyMMdd}-{(count + 1):D4}";

        var quotation = new Quotation
        {
            CustomerId = request.CustomerId,
            ReferenceNo = referenceNo,
            QuotationDate = request.QuotationDate,
            ExpiryDate = request.ExpiryDate,
            TotalAmount = totalAmount,
            Discount = request.Discount,
            Note = request.Note,
            Status = request.Status,
            QuotationItems = quotationItems
        };

        await unitOfWork.Quotations.AddAsync(quotation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(quotation.Id, "Quotation created successfully.");
    }
}

