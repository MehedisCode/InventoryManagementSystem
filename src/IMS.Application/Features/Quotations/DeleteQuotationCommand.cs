using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Quotations;

public class DeleteQuotationCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteQuotationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteQuotationCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteQuotationCommand request, CancellationToken cancellationToken)
    {
        var quotation = await unitOfWork.Quotations.GetByIdAsync(request.Id, cancellationToken);
        if (quotation == null)
            return ApiResponse<bool>.ErrorResponse("Quotation not found.");

        await unitOfWork.Quotations.DeleteAsync(quotation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Quotation deleted successfully.");
    }
}
