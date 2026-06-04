using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using MediatR;

namespace IMS.Application.Features.Currencies;

public class CreateCurrencyCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
}

public class CreateCurrencyCommandValidator : AbstractValidator<CreateCurrencyCommand>
{
    public CreateCurrencyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Symbol).NotEmpty().MaximumLength(10);
    }
}

public class CreateCurrencyCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateCurrencyCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateCurrencyCommand request, CancellationToken cancellationToken)
    {
        var currency = new Currency
        {
            Name = request.Name,
            Code = request.Code,
            Symbol = request.Symbol
        };

        await unitOfWork.Currencies.AddAsync(currency, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.SuccessResponse(currency.Id, "Currency created successfully.");
    }
}

