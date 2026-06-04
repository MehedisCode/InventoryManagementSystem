using System.Net;
using System.Text.Json;
using FluentValidation;
using IMS.Domain.Exceptions;
using IMS.Application.Common;

namespace IMS.API.Middleware;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred while processing the request: {Method} {Path}",
                context.Request.Method, context.Request.Path);

            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        ApiResponse<string> response;

        switch (exception)
        {
            case ValidationException validationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                var errors = validationException.Errors.Select(e => e.ErrorMessage).ToList();
                response = ApiResponse<string>.ErrorResponse(string.Join("; ", errors));
                break;

            case NotFoundException notFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response = ApiResponse<string>.ErrorResponse(notFoundException.Message);
                break;

            case BusinessRuleException businessRuleException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = ApiResponse<string>.ErrorResponse(businessRuleException.Message);
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                response = ApiResponse<string>.ErrorResponse("Unauthorized access.");
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = ApiResponse<string>.ErrorResponse("An internal server error occurred. Please try again later.");
                break;
        }

        var result = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return context.Response.WriteAsync(result);
    }
}
