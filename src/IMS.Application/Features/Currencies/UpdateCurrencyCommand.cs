using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Currencies;

public class UpdateCurrencyCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
}

public class UpdateCurrencyCommandValidator : AbstractValidator<UpdateCurrencyCommand>
{
    public UpdateCurrencyCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Symbol).NotEmpty().MaximumLength(10);
    }
}

public class UpdateCurrencyCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateCurrencyCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateCurrencyCommand request, CancellationToken cancellationToken)
    {
        var currency = await unitOfWork.Currencies.GetByIdAsync(request.Id, cancellationToken);
        if (currency == null)
            return ApiResponse<bool>.ErrorResponse("Currency not found.");

        currency.Name = request.Name;
        currency.Code = request.Code;
        currency.Symbol = request.Symbol;

        await unitOfWork.Currencies.UpdateAsync(currency, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Currency updated successfully.");
    }
}
