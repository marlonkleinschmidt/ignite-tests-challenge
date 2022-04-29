import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';    
import { AuthenticateUserUseCase } from '../authenticateUser/AuthenticateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { IAuthenticateUserResponseDTO } from '../authenticateUser/IAuthenticateUserResponseDTO';
import { ShowUserProfileError } from './ShowUserProfileError';


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;


describe("Authenticate User",()=>{

  beforeAll(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);    
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  });

  it("Should be able to list user profile by id", async () => {

    const user: ICreateUserDTO = {
      name: "NewUserTest",
      email: "newusertest@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);
    
    const userAuth : IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const user_id = userAuth.user.id as string;

    const result = await showUserProfileUseCase.execute(user_id);
    
    expect(result).toHaveProperty("id");

  });


  it("Should not be able to list un-existing users profile by id", async () => {
    expect(async () => {
      const user_id = "asdfg-987654"
      await showUserProfileUseCase.execute(user_id)
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })

});