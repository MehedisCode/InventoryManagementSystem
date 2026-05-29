using System.Collections.Generic;
using IMS.Domain.Entities;

namespace IMS.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(ApplicationUser user, IList<string> roles);
}