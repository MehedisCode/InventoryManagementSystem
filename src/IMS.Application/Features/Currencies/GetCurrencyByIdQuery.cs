using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Currencies;

public class GetCurrencyByIdQuery(Guid id) : IRequest<ApiResponse<CurrencyDto>>
{
    public Guid Id { get; set; } = id;
}

public class GetCurrencyByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetCurrencyByIdQuery, ApiResponse<CurrencyDto>>
{
    public async Task<ApiResponse<CurrencyDto>> Handle(GetCurrencyByIdQuery request, CancellationToken cancellationToken)
    {
        var currency = await unitOfWork.Currencies.GetByIdAsync(request.Id, cancellationToken);
        if (currency == null)
            return ApiResponse<CurrencyDto>.ErrorResponse("Currency not found.");

        var result = new CurrencyDto
        {
            Id = currency.Id,
            Name = currency.Name,
            Code = currency.Code,
            Symbol = currency.Symbol
        };

        return ApiResponse<CurrencyDto>.SuccessResponse(result);
    }
}
