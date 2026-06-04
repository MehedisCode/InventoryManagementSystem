using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Currencies;

public class GetAllCurrenciesQuery : IRequest<ApiResponse<List<CurrencyDto>>>;

public class GetAllCurrenciesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllCurrenciesQuery, ApiResponse<List<CurrencyDto>>>
{
    public async Task<ApiResponse<List<CurrencyDto>>> Handle(GetAllCurrenciesQuery request, CancellationToken cancellationToken)
    {
        var currencies = await unitOfWork.Currencies.GetAllAsync(cancellationToken);

        var result = currencies.Select(c => new CurrencyDto
        {
            Id = c.Id,
            Name = c.Name,
            Code = c.Code,
            Symbol = c.Symbol
        }).ToList();

        return ApiResponse<List<CurrencyDto>>.SuccessResponse(result);
    }
}

