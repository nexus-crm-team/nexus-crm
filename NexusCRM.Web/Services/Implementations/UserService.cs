using NexusCRM.Web.DTOs.Users;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Entities.Enums;
using NexusCRM.Web.Repositories.Interfaces;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Services.Implementations;

public class UserService(IUserRepository userRepository, ICompanyRepository companyRepository) : IUserService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly ICompanyRepository _companyRepository = companyRepository;

    public async Task<Result<bool>> AssignRoleAsync(string userId, UserRole role)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<bool>.Fail("Invalid User Data");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            return Result<bool>.Fail("User Not Found");

        user.Role = role;
        _userRepository.Update(user);
        await _userRepository.SaveAsync();
        return Result<bool>.Success();
    }

    public async Task<Result<bool>> DeleteAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<bool>.Fail("User id is required");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            return Result<bool>.Fail("User Not Found");

        await _userRepository.Delete(user);
        await _userRepository.SaveAsync();
        return Result<bool>.Success();
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var userExists = await _userRepository.ExistsByEmailAsync(email);
        return userExists;
    }

    public async Task<bool> ExistsByPhoneNumberAsync(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        var userExists = await _userRepository.ExistsByPhoneNumberAsync(phoneNumber);
        return userExists;
    }

    public async Task<bool> ExistsByUserNameAsync(string userName)
    {
        if (string.IsNullOrWhiteSpace(userName))
            return false;

        var userExists = await _userRepository.ExistsByUserNameAsync(userName);
        return userExists;
    }

    public async Task<Result<List<DetailsUserDto>>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var userDtos = MapToDetailsDto(users);

        return Result<List<DetailsUserDto>>.Success(userDtos);
    }    

    public async Task<Result<List<DetailsUserDto>>> GetByCompanyIdAsync(int companyId)
    {
        var users = await _userRepository.GetByCompanyIdAsync(companyId);
        var userDtos = MapToDetailsDto(users);

        return Result<List<DetailsUserDto>>.Success(userDtos);
    }

    public async Task<Result<DetailsUserDto>> GetByEmailAsync(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result<DetailsUserDto>.Fail("Email is required");
        
        var user = await _userRepository.GetByEmailAsync(email);
        return user is null
            ? Result<DetailsUserDto>.Fail("User Not Found")
            : Result<DetailsUserDto>.Success(MapToDetailsDto(user));
    }

    public async Task<Result<DetailsUserDto>> GetByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return Result<DetailsUserDto>.Fail("Invalid user id");

        var user = await _userRepository.GetByIdAsync(id);
        return user is null
            ? Result<DetailsUserDto>.Fail("User Not Found")
            : Result<DetailsUserDto>.Success(MapToDetailsDto(user));
    }

    public async Task<Result<DetailsUserDto>> GetByPhoneNumberAsync(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return Result<DetailsUserDto>.Fail("Invalid phone number");

        var user = await _userRepository.GetByPhoneNumberAsync(phoneNumber);
        return user is null
            ? Result<DetailsUserDto>.Fail("User Not Found")
            : Result<DetailsUserDto>.Success(MapToDetailsDto(user));
    }

    public async Task<Result<List<DetailsUserDto>>> GetByRoleAsync(UserRole role)
    {
        var users = await _userRepository.GetByRoleAsync(role);
        var userDtos = MapToDetailsDto(users);

        return Result<List<DetailsUserDto>>.Success(userDtos);
    }

    public async Task<Result<List<DetailsUserDto>>> GetByUserNameAsync(string userName)
    {
        if (string.IsNullOrWhiteSpace(userName))
            return Result<List<DetailsUserDto>>.Fail("Invalid UserName Data");

        var users = await _userRepository.GetByUserNameAsync(userName);
        var userDtos = MapToDetailsDto(users);

        return Result<List<DetailsUserDto>>.Success(userDtos);
    }

    public async Task<Result<bool>> UpdateAsync(string id, UpdateUserDto? dto)
    {
        if (string.IsNullOrWhiteSpace(id))
            return Result<bool>.Fail("Invalid User Data");

        if (dto is null)
            return Result<bool>.Fail("Invalid User Input Data");

        var user = await _userRepository.GetByIdAsync(id);
        if (user is null)
            return Result<bool>.Fail("User Not Found");

        user.UserName = dto.UserName;
        user.Email = dto.Email;
        user.PhoneNumber = dto.PhoneNumber;
        if (!string.IsNullOrEmpty(dto.AvatarUrl))
            user.AvatarUrl = dto.AvatarUrl;
        if (!string.IsNullOrEmpty(dto.Password))
            user.PasswordHash = dto.Password;

        _userRepository.Update(user);
        await _userRepository.SaveAsync();
        return Result<bool>.Success();
    }


    public List<DetailsUserDto> MapToDetailsDto(List<User>? userEntities)
    {
        if (userEntities is null)
            return [];

        List<DetailsUserDto> userDtos = new(userEntities.Count);
        foreach (var user in userEntities)
        {
            var userDto = new DetailsUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                RegDate = user.RegDate,
                CompanyId = user.CompanyId,
            };
            userDtos.Add(userDto);
        }
        return userDtos;
    }
    public DetailsUserDto MapToDetailsDto(User userEntity)
        => new()
        {
            Id = userEntity.Id,
            UserName = userEntity.UserName,
            Email = userEntity.Email,
            PhoneNumber = userEntity.PhoneNumber,
            AvatarUrl = userEntity.AvatarUrl,
            Role = userEntity.Role,
            RegDate = userEntity.RegDate,
            CompanyId = userEntity.CompanyId,
        };
}
