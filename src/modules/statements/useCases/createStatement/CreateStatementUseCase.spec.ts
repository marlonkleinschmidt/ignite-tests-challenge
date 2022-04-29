import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../../../users/useCases/authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create Statement",()=>{

  beforeAll(()=>{

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();   
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });


  it("Should be able to deposit",async ()=>{
    
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

    const deposit: ICreateStatementDTO = {
      user_id: userAuth.user.id as string,      
      type: 'deposit' as any,
      amount: 500,
      description: "Deposito online"
    }

    const result = await createStatementUseCase.execute(deposit);

    expect(result.amount).toEqual(deposit.amount)

  });

  it("Should not be able to deposit with a user inexists",async ()=>{
    
    expect(async () => {
      const deposit: ICreateStatementDTO = {
        user_id: 'userFail',      
        type: 'deposit' as any,
        amount: 150,
        description: "Deposito online fail"
      }

      await createStatementUseCase.execute(deposit);

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

  })

  it("Should be able to withdraw money with balance",async ()=>{
    
    const user: ICreateUserDTO = {
      name: "NewUserTest2",
      email: "newusertest2@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);

    const userAuth : IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const deposit: ICreateStatementDTO = {
      user_id: userAuth.user.id as string,      
      type: 'deposit' as any,
      amount: 1000,
      description: "Deposito online "
    }

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: userAuth.user.id as string,      
      type: 'withdraw' as any,
      amount: 50,
      description: "Withdraw online"
    }

    const result = await createStatementUseCase.execute(withdraw);

    expect(result.amount).toEqual(withdraw.amount)

  });

  it("Should be able to withdraw money with balance",async ()=>{
    
    
    expect(async()=>{

      const user: ICreateUserDTO = {
        name: "NewUserTest3",
        email: "newusertest3@email.com",
        password: "123456"
      }
      await createUserUseCase.execute(user);
  
      const userAuth : IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });
  
      const withdraw: ICreateStatementDTO = {
        user_id: userAuth.user.id as string,      
        type: 'withdraw' as any,
        amount: 50,
        description: "Withdraw online"
      }
  
      await createStatementUseCase.execute(withdraw);
    
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

  });

});