using MediatR;
using IMS.Application.Common;
using IMS.Application.Interfaces;

namespace IMS.Application.Features.Company;

public class GetCompanySettingsQuery : IRequest<ApiResponse<CompanyDto>>;

public class GetCompanySettingsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetCompanySettingsQuery, ApiResponse<CompanyDto>>
{
    public async Task<ApiResponse<CompanyDto>> Handle(GetCompanySettingsQuery request, CancellationToken cancellationToken)
    {
        var company = await unitOfWork.Company.GetCompanyWithCurrencyAsync(cancellationToken);

        if (company == null)
            return ApiResponse<CompanyDto>.SuccessResponse(new CompanyDto(), "No company settings found.");

        var result = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Email = company.Email,
            Phone = company.Phone,
            Address = company.Address,
            LogoUrl = company.LogoUrl,
            CurrencyId = company.CurrencyId,
            CurrencyName = company.Currency.Name,
            CurrencySymbol = company.Currency.Symbol
        };

        return ApiResponse<CompanyDto>.SuccessResponse(result);
    }
}

