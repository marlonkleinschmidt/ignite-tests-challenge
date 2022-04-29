
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";





let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let authenticateUserUseCase: AuthenticateUserUseCase;

let getBalanceUseCase: GetBalanceUseCase; 

interface IRequest {
  user_id: string;
}

describe("Get Balance",()=>{

  beforeAll(()=>{

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();   
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository,inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });


  it("Should be able to  get balance",async ()=>{
    
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

    const userIdAuthenticate: IRequest = {
      user_id: userAuth.user.id as string
    } 

    const deposit: ICreateStatementDTO = {
      user_id: userAuth.user.id as string,      
      type: 'deposit' as any,
      amount: 500,
      description: "Deposito online"
    }
    await createStatementUseCase.execute(deposit);

    const balance = await getBalanceUseCase.execute(userIdAuthenticate);

    expect(balance.statement[0]).toHaveProperty("id")
    expect(balance.balance).toEqual(500)

  });

  it("should not be able to get balance from non-existing user", async () => {
    expect(async () => {
      const user_id = "userFail"
      await getBalanceUseCase.execute({user_id})
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
  
});