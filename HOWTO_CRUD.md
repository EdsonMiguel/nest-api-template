# How to Criar um CRUD em um Novo Modulo

Este guia mostra como criar um CRUD usando a arquitetura do template: Clean Architecture + DDD com NestJS, TypeORM e controllers HTTP.

O exemplo usa uma entidade ficticia `Product`. Adapte nomes, campos e regras para o seu dominio.

## Visao Geral

Um CRUD neste template normalmente passa por estas camadas:

```text
presentation/http -> application/use-cases -> domain/repositories -> infra/database/typeorm
```

Responsabilidades:

- `domain`: entidade pura, value objects, erros e contrato do repository.
- `application`: use cases, regras de fluxo e validacoes que dependem de repository.
- `infra`: entity TypeORM, mapper e repository concreto.
- `presentation`: controller, DTOs e response mapper.

Regra principal: use cases dependem de abstracoes, nao de TypeORM.

## 1. Criar a Estrutura do Modulo

Crie a estrutura:

```text
src/modules/products/
  products.module.ts
  domain/
    entities/
    errors/
    repositories/
    value-objects/
  application/
    use-cases/
    errors/
  infra/
    database/
      typeorm/
        entities/
        mappers/
        repositories/
  presentation/
    http/
      dtos/
      products.controller.ts
```

## 2. Criar a Entidade de Dominio

Arquivo:

```text
src/modules/products/domain/entities/product.ts
```

Exemplo:

```ts
import { randomUUID } from 'node:crypto';
import { Entity, EntityId } from '../../../../shared/domain/entities/entity';

export type ProductProps = {
  name: string;
  description: string | null;
  priceInCents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductProps = {
  id?: EntityId;
  name: string;
  description?: string | null;
  priceInCents: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id: EntityId) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(props: CreateProductProps): Product {
    const now = new Date();

    return new Product(
      {
        name: props.name,
        description: props.description ?? null,
        priceInCents: props.priceInCents,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      props.id ?? randomUUID(),
    );
  }

  update(input: {
    name?: string;
    description?: string | null;
    priceInCents?: number;
    isActive?: boolean;
  }): void {
    this.props.name = input.name ?? this.props.name;
    this.props.description =
      input.description === undefined
        ? this.props.description
        : input.description;
    this.props.priceInCents = input.priceInCents ?? this.props.priceInCents;
    this.props.isActive = input.isActive ?? this.props.isActive;
    this.props.updatedAt = new Date();
  }
}
```

Importante:

- Nao use decorators TypeORM na entidade de dominio.
- Coloque invariantes do dominio aqui ou em value objects.
- Evite regras de banco, HTTP ou framework nesta camada.

## 3. Criar o Contrato do Repository

Arquivo:

```text
src/modules/products/domain/repositories/products.repository.ts
```

Exemplo:

```ts
import { Product } from '../entities/product';

export type ListProductsParams = {
  page?: number;
  perPage?: number;
};

export type PaginatedProductsResult = {
  data: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export abstract class ProductsRepository {
  abstract create(product: Product): Promise<void>;
  abstract save(product: Product): Promise<void>;
  abstract delete(product: Product): Promise<void>;
  abstract findById(id: string): Promise<Product | null>;
  abstract list(params: ListProductsParams): Promise<PaginatedProductsResult>;
}
```

Este contrato fica no dominio porque os use cases precisam dele, mas nao devem saber qual banco sera usado.

## 4. Criar Use Cases

Crie arquivos em:

```text
src/modules/products/application/use-cases/
```

Use cases comuns para CRUD:

```text
create-product.use-case.ts
find-product-by-id.use-case.ts
list-products.use-case.ts
update-product.use-case.ts
delete-product.use-case.ts
```

Exemplo de create:

```ts
import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { ProductsRepository } from '../../domain/repositories/products.repository';

export type CreateProductUseCaseInput = {
  name: string;
  description?: string | null;
  priceInCents: number;
};

export type CreateProductUseCaseOutput = {
  product: Product;
};

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(
    input: CreateProductUseCaseInput,
  ): Promise<CreateProductUseCaseOutput> {
    const product = Product.create(input);

    await this.productsRepository.create(product);

    return { product };
  }
}
```

Exemplo de update:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { ProductsRepository } from '../../domain/repositories/products.repository';

export type UpdateProductUseCaseInput = {
  id: string;
  name?: string;
  description?: string | null;
  priceInCents?: number;
  isActive?: boolean;
};

export type UpdateProductUseCaseOutput = {
  product: Product;
};

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async execute(
    input: UpdateProductUseCaseInput,
  ): Promise<UpdateProductUseCaseOutput> {
    const product = await this.productsRepository.findById(input.id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.update(input);

    await this.productsRepository.save(product);

    return { product };
  }
}
```

Observacao: em projetos maiores, prefira erros de application proprios em vez de `NotFoundException` no use case. O filtro global pode mapear esses erros para HTTP.

## 5. Criar Entity TypeORM

Arquivo:

```text
src/modules/products/infra/database/typeorm/entities/product-typeorm.entity.ts
```

Exemplo:

```ts
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class ProductTypeormEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'price_in_cents', type: 'integer' })
  priceInCents!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt!: Date | null;
}
```

Esta classe e apenas persistencia. Ela nao e entidade de dominio.

## 6. Criar Mapper

Arquivo:

```text
src/modules/products/infra/database/typeorm/mappers/product-typeorm.mapper.ts
```

Exemplo:

```ts
import { Product } from '../../../../domain/entities/product';
import { ProductTypeormEntity } from '../entities/product-typeorm.entity';

export class ProductTypeormMapper {
  static toDomain(entity: ProductTypeormEntity): Product {
    return Product.create({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      priceInCents: entity.priceInCents,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toTypeorm(product: Product): ProductTypeormEntity {
    const entity = new ProductTypeormEntity();

    entity.id = String(product.id);
    entity.name = product.name;
    entity.description = product.description;
    entity.priceInCents = product.priceInCents;
    entity.isActive = product.isActive;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;

    return entity;
  }
}
```

Mapper evita que dominio e banco fiquem acoplados.

## 7. Implementar Repository TypeORM

Arquivo:

```text
src/modules/products/infra/database/typeorm/repositories/typeorm-products.repository.ts
```

Exemplo:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../domain/entities/product';
import {
  ListProductsParams,
  PaginatedProductsResult,
  ProductsRepository,
} from '../../../../domain/repositories/products.repository';
import { ProductTypeormEntity } from '../entities/product-typeorm.entity';
import { ProductTypeormMapper } from '../mappers/product-typeorm.mapper';

@Injectable()
export class TypeormProductsRepository implements ProductsRepository {
  constructor(
    @InjectRepository(ProductTypeormEntity)
    private readonly repository: Repository<ProductTypeormEntity>,
  ) {}

  async create(product: Product): Promise<void> {
    await this.repository.insert(ProductTypeormMapper.toTypeorm(product));
  }

  async save(product: Product): Promise<void> {
    await this.repository.save(ProductTypeormMapper.toTypeorm(product));
  }

  async delete(product: Product): Promise<void> {
    await this.repository.softDelete(String(product.id));
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity ? ProductTypeormMapper.toDomain(entity) : null;
  }

  async list(params: ListProductsParams): Promise<PaginatedProductsResult> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const [entities, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data: entities.map((entity) => ProductTypeormMapper.toDomain(entity)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
```

## 8. Criar DTOs e Response Mapper

Arquivos:

```text
src/modules/products/presentation/http/dtos/create-product.dto.ts
src/modules/products/presentation/http/dtos/update-product.dto.ts
src/modules/products/presentation/http/dtos/list-products-query.dto.ts
src/modules/products/presentation/http/dtos/product-response.dto.ts
```

Exemplo de create DTO:

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Notebook' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Notebook for work' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: 350000, minimum: 1 })
  @IsInt()
  @Min(1)
  priceInCents!: number;
}
```

Exemplo de response:

```ts
import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from '../../../../../shared/domain/entities/entity';
import { Product } from '../../../domain/entities/product';

export class ProductResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: EntityId;

  @ApiProperty({ example: 'Notebook' })
  name!: string;

  @ApiProperty({ example: 'Notebook for work', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 350000 })
  priceInCents!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class ProductResponseMapper {
  static fromDomain(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceInCents: product.priceInCents,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
```

DTOs validam entrada. Response mapper controla o que sai para o cliente.

## 9. Criar Controller

Arquivo:

```text
src/modules/products/presentation/http/products.controller.ts
```

Exemplo:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { FindProductByIdUseCase } from '../../application/use-cases/find-product-by-id.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { CreateProductDto } from './dtos/create-product.dto';
import { ListProductsQueryDto } from './dtos/list-products-query.dto';
import {
  ProductResponseDto,
  ProductResponseMapper,
} from './dtos/product-response.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ProductResponseDto })
  async create(@Body() body: CreateProductDto): Promise<ProductResponseDto> {
    const { product } = await this.createProductUseCase.execute(body);

    return ProductResponseMapper.fromDomain(product);
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated products list' })
  async list(@Query() query: ListProductsQueryDto) {
    const result = await this.listProductsUseCase.execute(query);

    return {
      ...result,
      data: result.data.map((product) =>
        ProductResponseMapper.fromDomain(product),
      ),
    };
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    const { product } = await this.findProductByIdUseCase.execute({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductResponseMapper.fromDomain(product);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const { product } = await this.updateProductUseCase.execute({
      id,
      ...body,
    });

    return ProductResponseMapper.fromDomain(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Product deleted' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteProductUseCase.execute({ id });
  }
}
```

Controller deve somente adaptar HTTP para use case.

## 10. Registrar o Modulo

Arquivo:

```text
src/modules/products/products.module.ts
```

Exemplo:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { ProductsRepository } from './domain/repositories/products.repository';
import { ProductTypeormEntity } from './infra/database/typeorm/entities/product-typeorm.entity';
import { TypeormProductsRepository } from './infra/database/typeorm/repositories/typeorm-products.repository';
import { ProductsController } from './presentation/http/products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductTypeormEntity])],
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    FindProductByIdUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    {
      provide: ProductsRepository,
      useClass: TypeormProductsRepository,
    },
  ],
  exports: [ProductsRepository],
})
export class ProductsModule {}
```

Depois registre em `AppModule`:

```ts
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    // ...
    ProductsModule,
  ],
})
export class AppModule {}
```

## 11. Criar Migration

Crie uma migration para a tabela:

```bash
npm run migration:create
```

Ou gere a partir da entity:

```bash
npm run migration:generate
```

Exemplo de tabela:

```sql
CREATE TABLE products (
  id uuid NOT NULL,
  name varchar(255) NOT NULL,
  description text NULL,
  price_in_cents integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  deleted_at timestamp NULL,
  CONSTRAINT pk_products PRIMARY KEY (id)
);
```

Execute:

```bash
npm run migration:run
```

## 12. Testar o CRUD

Com o banco preparado:

```bash
docker compose up -d
npm run migration:run
npm run seed:run
npm run start:dev
```

Acesse Swagger:

```text
http://localhost:3333/api/docs
```

Rotas esperadas:

```text
POST   /api/v1/products
GET    /api/v1/products
GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

Como o guard JWT e global, as rotas serao privadas por padrao. Use `POST /api/v1/auth/login` e autorize o Swagger com o access token.

## Checklist

- Entidade de dominio sem TypeORM.
- Repository abstrato no dominio.
- Use cases dependendo de abstracoes.
- Entity TypeORM separada.
- Mapper entre banco e dominio.
- Repository TypeORM implementando o contrato.
- DTOs com `class-validator`.
- Controller chamando apenas use cases.
- Response mapper nao expondo campos sensiveis.
- Module registrando providers e controller.
- Migration criada e rodada.
- Swagger documentando DTOs e endpoints.
- `npm run build` passando.
